# Generated by Django 5.1.5 on 2025-02-23 13:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('exchanger', '0003_selecteditem_exchanger_session'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exchange',
            name='timestamp',
        ),
        migrations.AddField(
            model_name='exchange',
            name='is_accepted',
            field=models.BooleanField(default=False),
        ),
    ]
