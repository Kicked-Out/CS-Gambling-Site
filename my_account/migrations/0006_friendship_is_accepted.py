<<<<<<< HEAD
# Generated by Django 5.1.5 on 2025-02-16 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0005_alter_profile_wallet_balance_friendship'),
    ]

    operations = [
        migrations.AddField(
            model_name='friendship',
            name='is_accepted',
            field=models.BooleanField(default=False),
        ),
    ]
=======
# Generated by Django 5.1.5 on 2025-02-16 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0005_alter_profile_wallet_balance_friendship'),
    ]

    operations = [
        migrations.AddField(
            model_name='friendship',
            name='is_accepted',
            field=models.BooleanField(default=False),
        ),
    ]
>>>>>>> 587eeefc3f2ad2c4ea3190741cdaa5f9b6d795f9
