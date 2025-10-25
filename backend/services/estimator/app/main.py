from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

app = FastAPI(
    title="RealSync Tax Estimator Service",
    description="Calculates Peruvian real estate taxes and fees",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EstimatorInput(BaseModel):
    """Input parameters for tax estimation"""
    property_id: Optional[str] = None
    sale_price: Decimal = Field(..., gt=0, description="Sale price in PEN")
    municipality: str = Field(..., description="Municipality code (e.g., LIMA, MIRAFLORES)")
    acquisition_price: Optional[Decimal] = Field(None, description="Original purchase price")
    acquisition_date: Optional[date] = None
    is_primary_residence: bool = Field(False, description="Is this the seller's primary residence?")
    ownership_duration_years: Optional[int] = None


class TaxBreakdown(BaseModel):
    """Individual tax component"""
    name: str
    amount: Decimal
    percentage: Optional[Decimal]
    description: str


class EstimatorOutput(BaseModel):
    """Tax estimation results"""
    estimator_run_id: Optional[str] = None
    inputs: EstimatorInput
    alcabala: Decimal
    impuesto_renta: Decimal
    commission: Decimal
    notary_fees: Decimal
    registry_fees: Decimal
    other_fees: Decimal
    total_deductions: Decimal
    net_profit: Decimal
    breakdown: List[TaxBreakdown]
    assumptions: List[str]
    disclaimer: str
    calculated_at: datetime


class TaxCalculator:
    """Peru-specific tax calculation logic"""

    # Tax rates (as of 2024)
    ALCABALA_RATE = Decimal('0.03')  # 3% of property value
    ALCABALA_UIT_THRESHOLD = 10  # Exempt for properties below 10 UIT
    UIT_VALUE_2024 = Decimal('5150')  # Updated annually

    COMMISSION_RATE = Decimal('0.04')  # 4% tech-enabled commission
    NOTARY_BASE_FEE = Decimal('500')  # Base notary fee in PEN
    REGISTRY_BASE_FEE = Decimal('300')  # SUNARP registration fee

    # Capital gains tax rates
    CAPITAL_GAINS_RATE = Decimal('0.05')  # 5% for first bracket
    CAPITAL_GAINS_EXEMPTION_UIT = 5  # Exempt if gain < 5 UIT

    def calculate_alcabala(
        self,
        sale_price: Decimal,
        municipality: str
    ) -> tuple[Decimal, List[str]]:
        """
        Calculate Alcabala (property transfer tax)
        Formula: 3% of sale price, with exemptions for properties below 10 UIT
        """
        assumptions = []

        # Check exemption threshold
        exemption_threshold = self.UIT_VALUE_2024 * self.ALCABALA_UIT_THRESHOLD

        if sale_price <= exemption_threshold:
            assumptions.append(
                f"Property value ({sale_price} PEN) is below exemption threshold "
                f"({exemption_threshold} PEN = 10 UIT). Alcabala is 0."
            )
            return Decimal('0'), assumptions

        # Calculate taxable amount (value above exemption)
        taxable_amount = sale_price - exemption_threshold
        alcabala = taxable_amount * self.ALCABALA_RATE

        assumptions.append(
            f"Alcabala calculated as 3% of taxable amount "
            f"({taxable_amount} PEN = sale price - exemption threshold)"
        )

        return alcabala, assumptions

    def calculate_impuesto_renta(
        self,
        sale_price: Decimal,
        acquisition_price: Optional[Decimal],
        acquisition_date: Optional[date],
        is_primary_residence: bool
    ) -> tuple[Decimal, List[str]]:
        """
        Calculate Impuesto a la Renta (capital gains tax)
        """
        assumptions = []

        # If no acquisition price provided, use conservative estimate
        if not acquisition_price:
            # Assume 80% of sale price as acquisition cost
            acquisition_price = sale_price * Decimal('0.80')
            assumptions.append(
                f"No acquisition price provided. Estimated at 80% of sale price "
                f"({acquisition_price} PEN) for conservative calculation."
            )

        # Calculate capital gain
        capital_gain = sale_price - acquisition_price

        if capital_gain <= 0:
            assumptions.append("No capital gain. Impuesto a la Renta is 0.")
            return Decimal('0'), assumptions

        # Check exemption for primary residence
        if is_primary_residence:
            exemption_limit = self.UIT_VALUE_2024 * self.CAPITAL_GAINS_EXEMPTION_UIT
            if capital_gain <= exemption_limit:
                assumptions.append(
                    f"Primary residence exemption applies. "
                    f"Gain ({capital_gain} PEN) is below limit ({exemption_limit} PEN = 5 UIT)."
                )
                return Decimal('0'), assumptions

        # Calculate tax
        tax = capital_gain * self.CAPITAL_GAINS_RATE

        assumptions.append(
            f"Capital gains tax calculated as 5% of gain "
            f"({capital_gain} PEN = sale price - acquisition price)"
        )

        return tax, assumptions

    def calculate_commission(self, sale_price: Decimal) -> Decimal:
        """Calculate real estate commission"""
        return sale_price * self.COMMISSION_RATE

    def calculate_notary_fees(self, sale_price: Decimal) -> Decimal:
        """
        Estimate notary fees (escritura pública)
        Typically 0.5-1% of sale price + base fee
        """
        percentage_fee = sale_price * Decimal('0.007')  # 0.7%
        return self.NOTARY_BASE_FEE + percentage_fee

    def calculate_registry_fees(self, sale_price: Decimal) -> Decimal:
        """
        Estimate SUNARP registry fees
        Formula: ~0.3% of property value
        """
        percentage_fee = sale_price * Decimal('0.003')
        return self.REGISTRY_BASE_FEE + percentage_fee


@app.get("/")
async def root():
    return {
        "service": "estimator-service",
        "version": "1.0.0",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/v1/estimator/calculate", response_model=EstimatorOutput)
async def calculate_taxes(input_data: EstimatorInput):
    """
    Calculate all taxes, fees, and net profit for a real estate transaction
    """
    try:
        calculator = TaxCalculator()
        assumptions = []

        # Calculate Alcabala
        alcabala, alcabala_assumptions = calculator.calculate_alcabala(
            input_data.sale_price,
            input_data.municipality
        )
        assumptions.extend(alcabala_assumptions)

        # Calculate Impuesto a la Renta
        impuesto_renta, renta_assumptions = calculator.calculate_impuesto_renta(
            input_data.sale_price,
            input_data.acquisition_price,
            input_data.acquisition_date,
            input_data.is_primary_residence
        )
        assumptions.extend(renta_assumptions)

        # Calculate commission
        commission = calculator.calculate_commission(input_data.sale_price)
        assumptions.append(
            f"Commission calculated as 4% of sale price (tech-enabled rate)"
        )

        # Calculate notary fees
        notary_fees = calculator.calculate_notary_fees(input_data.sale_price)
        assumptions.append(
            f"Notary fees estimated at base fee + 0.7% of sale price"
        )

        # Calculate registry fees
        registry_fees = calculator.calculate_registry_fees(input_data.sale_price)
        assumptions.append(
            f"SUNARP registry fees estimated at base fee + 0.3% of sale price"
        )

        # Other fees (optional add-ons)
        other_fees = Decimal('0')

        # Calculate totals
        total_deductions = (
            alcabala +
            impuesto_renta +
            commission +
            notary_fees +
            registry_fees +
            other_fees
        )

        net_profit = input_data.sale_price - total_deductions

        # If acquisition price was provided, adjust net profit
        if input_data.acquisition_price:
            net_profit -= input_data.acquisition_price

        # Create detailed breakdown
        breakdown = [
            TaxBreakdown(
                name="Alcabala (Transfer Tax)",
                amount=alcabala,
                percentage=TaxCalculator.ALCABALA_RATE * 100 if alcabala > 0 else None,
                description="Municipal transfer tax on property sales"
            ),
            TaxBreakdown(
                name="Impuesto a la Renta (Capital Gains)",
                amount=impuesto_renta,
                percentage=TaxCalculator.CAPITAL_GAINS_RATE * 100 if impuesto_renta > 0 else None,
                description="Tax on profit from property sale"
            ),
            TaxBreakdown(
                name="Commission",
                amount=commission,
                percentage=TaxCalculator.COMMISSION_RATE * 100,
                description="Real estate agent commission"
            ),
            TaxBreakdown(
                name="Notary Fees",
                amount=notary_fees,
                percentage=None,
                description="Fees for escritura pública (public deed)"
            ),
            TaxBreakdown(
                name="Registry Fees (SUNARP)",
                amount=registry_fees,
                percentage=None,
                description="Property registry fees"
            ),
        ]

        return EstimatorOutput(
            inputs=input_data,
            alcabala=alcabala,
            impuesto_renta=impuesto_renta,
            commission=commission,
            notary_fees=notary_fees,
            registry_fees=registry_fees,
            other_fees=other_fees,
            total_deductions=total_deductions,
            net_profit=net_profit,
            breakdown=breakdown,
            assumptions=assumptions,
            disclaimer=(
                "This is an estimate only. Actual taxes and fees may vary. "
                "Consult with a licensed tax professional or notary for accurate calculations. "
                "Tax rates and UIT values are updated annually by SUNAT."
            ),
            calculated_at=datetime.now()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/estimator/uit-value")
async def get_current_uit():
    """Get current UIT value for reference"""
    return {
        "year": 2024,
        "uit_value_pen": float(TaxCalculator.UIT_VALUE_2024),
        "note": "UIT (Unidad Impositiva Tributaria) is updated annually by SUNAT"
    }
