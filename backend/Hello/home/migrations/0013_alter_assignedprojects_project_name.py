# Generated by Django 5.1.2 on 2025-03-22 10:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0012_alter_assignedprojects_project_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignedprojects',
            name='project_name',
            field=models.CharField(max_length=255),
        ),
    ]
