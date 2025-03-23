from django.contrib import admin
from .models import (
    Students, Professors, Projects, Assignedprojects, Requestform, Submittedprojects
)

# Register all models to make them fully manageable in the admin panel
admin.site.register(Students)
admin.site.register(Professors)
admin.site.register(Projects)
admin.site.register(Assignedprojects)
admin.site.register(Requestform)
admin.site.register(Submittedprojects)