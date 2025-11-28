
from dataclasses import dataclass


@dataclass
class UserRegister():
    user_name: str 
    user_email: str
    password: str
    
    def to_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}
    
@dataclass
class UserLogin():
    user_email: str
    password: str 
    
    def to_dict(self):
        return {field.name: getattr(self, field.name) for field in self.__dataclass_fields__.values()}

