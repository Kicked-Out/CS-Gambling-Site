# Generated by Django 5.1.5 on 2025-02-02 14:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0002_alter_profile_wallet_balance'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='avatar',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
