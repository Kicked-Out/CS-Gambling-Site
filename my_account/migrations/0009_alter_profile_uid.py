# Generated by Django 5.1.5 on 2025-02-17 17:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0008_alter_profile_uid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='uid',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
