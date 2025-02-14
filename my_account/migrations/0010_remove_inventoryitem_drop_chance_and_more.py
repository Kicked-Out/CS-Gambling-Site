# Generated by Django 5.1.5 on 2025-02-12 17:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('my_account', '0009_inventoryitem_drop_chance'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inventoryitem',
            name='drop_chance',
        ),
        migrations.AddField(
            model_name='profile',
            name='best_drop_image',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='best_drop_value',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='profile',
            name='expensive_case_image',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
