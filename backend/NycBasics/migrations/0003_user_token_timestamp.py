# Generated by Django 2.2 on 2022-11-24 20:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("NycBasics", "0002_auto_20221120_1529"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="token_timestamp",
            field=models.DateTimeField(auto_now=True),
        ),
    ]