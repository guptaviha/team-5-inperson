# Generated by Django 2.2 on 2022-12-12 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('NycBasics', '0006_auto_20221202_1709'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rating_review',
            name='rating',
            field=models.IntegerField(choices=[(1, 1), (2, 2), (3, 3), (4, 4), (5, 5)], default=0),
        ),
    ]
