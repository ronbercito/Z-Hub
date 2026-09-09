from pydantic import BaseModel, EmailStr, Field


class LicenseRequest(BaseModel):
    license_key: str = Field(min_length=4, max_length=120)


class AdminSetupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    password_confirmation: str = Field(min_length=10, max_length=128)


class SetupCompleteRequest(BaseModel):
    license_key: str = Field(min_length=4, max_length=120)
