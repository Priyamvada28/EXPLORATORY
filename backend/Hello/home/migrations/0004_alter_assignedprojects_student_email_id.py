# Generated by Django 5.1.2 on 2025-03-19 13:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0003_assignedprojects_professor_email_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='assignedprojects',
            name='student_email_id',
            field=models.ForeignKey(db_column='student_email_id', on_delete=django.db.models.deletion.CASCADE, to='home.students'),
        ),
    ]
