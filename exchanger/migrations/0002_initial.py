# Generated by Django 5.1.5 on 2025-02-24 11:10

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('exchanger', '0001_initial'),
        ('my_account', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='exchange',
            name='from_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_items', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='exchange',
            name='item',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='my_account.inventoryitem'),
        ),
        migrations.AddField(
            model_name='exchange',
            name='to_user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_items', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='selecteditem',
            name='item',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='my_account.inventoryitem'),
        ),
        migrations.AddField(
            model_name='selecteditem',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
