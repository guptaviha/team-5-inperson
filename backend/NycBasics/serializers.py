from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import (
    User,
    water_model,
    wifi_model,
    parking_model,
    bench_model,
    toilet_model,
    Rating_Review,
    average_rating_model,
)
from django.core.exceptions import ValidationError
from uuid import uuid4
from django.db.models import Q


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    username = serializers.CharField(
        required=True, validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(max_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password")


class UserLoginSerializer(serializers.ModelSerializer):
    # to accept either username or email
    user_id = serializers.CharField()
    password = serializers.CharField()
    token = serializers.CharField(required=False, read_only=True)
    username = serializers.CharField(required=False, read_only=True)

    def validate(self, data):

        # user,email,password validator
        user_id = data.get("user_id", None)
        password = data.get("password", None)
        if not user_id and not password:
            raise ValidationError("Details not entered.")
        user = None

        # if the email has been passed
        if "@" in user_id:
            user = User.objects.filter(
                Q(email=user_id) & Q(password=password)
            ).distinct()
            if not user.exists():
                raise ValidationError("User credentials are not correct.")
            user = User.objects.get(email=user_id)
        else:
            user = User.objects.filter(
                Q(username=user_id) & Q(password=password)
            ).distinct()
            if not user.exists():
                raise ValidationError("User credentials are not correct.")
            user = User.objects.get(username=user_id)
        if user.ifLogged:
            raise ValidationError("User already logged in.")
        user.ifLogged = True
        data["token"] = uuid4()
        user.token = data["token"]
        user.save()
        data["username"] = user.username
        return data

    class Meta:
        model = User
        fields = ("user_id", "password", "token", "username", "id")

        read_only_fields = ("token", "username")


class UserLogoutSerializer(serializers.ModelSerializer):
    token = serializers.CharField()
    status = serializers.CharField(required=False, read_only=True)

    def validate(self, data):
        token = data.get("token", None)
        print(token)
        user = None
        try:
            user = User.objects.get(token=token)
            if not user.ifLogged:
                raise ValidationError("User is not logged in.")
        except Exception as e:
            raise ValidationError(str(e))
        user.ifLogged = False
        user.token = ""
        user.save()
        data["status"] = "User is logged out."
        return data

    class Meta:
        model = User
        fields = (
            "token",
            "status",
        )


class water_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = water_model
        fields = "__all__"


class wifi_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = wifi_model
        fields = "__all__"


class bench_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = bench_model
        fields = "__all__"


class toilet_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = toilet_model
        fields = "__all__"


class parking_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = parking_model
        fields = "__all__"


class rating_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating_Review
        fields = "__all__"
        depth = 1


class review_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating_Review
        fields = "__all__"


class avgrating_modelSerializer(serializers.ModelSerializer):
    class Meta:
        model = average_rating_model
        fields = "__all__"
