# Generated by Django 5.1.5 on 2025-02-02 20:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cases', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='case',
            name='image',
            field=models.CharField(default=1, max_length=255),
            preserve_default=False,
        ),
    ]
