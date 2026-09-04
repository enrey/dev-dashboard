from pydantic import BaseModel, ConfigDict, Field, constr

HexColor = constr(pattern=r"^#[0-9a-fA-F]{6}$")


class UserRole(BaseModel):
    id: str
    name: str
    color: HexColor


class UserPageState(BaseModel):
    roles: list[UserRole] = Field(default_factory=list)
    user_roles: dict[str, list[UserRole]] = Field(default_factory=dict, alias="userRoles")
    user_names: dict[str, str] = Field(default_factory=dict, alias="userNames")
    linked_emails: dict[str, list[str]] = Field(default_factory=dict, alias="linkedEmails")
    version: int = 1

    model_config = ConfigDict(populate_by_name=True)


class PartialUserPageState(BaseModel):
    roles: list[UserRole] | None = None
    user_roles: dict[str, list[UserRole]] | None = Field(default=None, alias="userRoles")
    user_names: dict[str, str] | None = Field(default=None, alias="userNames")
    linked_emails: dict[str, list[str]] | None = Field(default=None, alias="linkedEmails")
    version: int | None = None

    model_config = ConfigDict(populate_by_name=True)


class SuccessResponse(BaseModel):
    success: bool


class StateUpdateResponse(SuccessResponse):
    version: int


class ErrorResponse(BaseModel):
    success: bool
    error: str


class ExistsResponse(BaseModel):
    exists: bool
