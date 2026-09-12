from pydantic import BaseModel, EmailStr, Field


class LicenseRequest(BaseModel):
    """Compatibilidad con activación manual para recuperación administrativa."""
    license_key: str = Field(min_length=4, max_length=120)


class CustomerRegistrationRequest(BaseModel):
    company_name: str = Field(min_length=2, max_length=180)
    contact_name: str = Field(min_length=2, max_length=180)
    email: EmailStr
    phone: str = Field(min_length=5, max_length=80)
    country: str = Field(min_length=2, max_length=100)


class AutoTrialSetupRequest(BaseModel):
    email: EmailStr
    installation_name: str = Field(default="Z-Hub", min_length=2, max_length=150)


class AdminSetupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    password_confirmation: str = Field(min_length=10, max_length=128)


class SetupCompleteRequest(BaseModel):
    """El cierre usa la licencia ya validada en servidor; el navegador no reenvía claves."""
    pass
