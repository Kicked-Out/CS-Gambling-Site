# Generated by Django 5.1.5 on 2025-02-14 18:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='is_banned',
            field=models.BooleanField(default=False),
        ),
    ]
