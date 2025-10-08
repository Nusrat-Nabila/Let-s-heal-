
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import UserAuth

class UserAuthJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
    #Return a UserAuth instance based on token info.
        try:
            user_id = validated_token.get('user_id')
            return UserAuth.objects.get(id=user_id)
        except UserAuth.DoesNotExist:
            return None
