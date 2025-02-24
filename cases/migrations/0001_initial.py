# Generated by Django 5.1.5 on 2025-02-24 11:10

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Case',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=100)),
                ('name_uk', models.CharField(max_length=100)),
                ('price', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='CaseSkin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('odds', models.DecimalField(decimal_places=3, max_digits=10)),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='case_skins', to='cases.case')),
            ],
        ),
        migrations.CreateModel(
            name='Skin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('name_uk', models.CharField(max_length=100)),
                ('image', models.CharField(max_length=100)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('case', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='skins', to='cases.case')),
            ],
        ),
    ]
