# Generated by Django 5.1.2 on 2025-03-21 16:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0009_submittedprojects_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='submittedprojects',
            name='file',
            field=models.FileField(blank=True, null=True, upload_to='submissions/'),
        ),
    ]
