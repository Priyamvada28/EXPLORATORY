from rest_framework import serializers
from .models import Assignedprojects, Professors, Projects, Requestform, Students, Submittedprojects


class AssignedprojectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignedprojects
        fields = '__all__'

class ProfessorsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professors
        fields = '__all__'

class ProjectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Projects
        fields = '__all__'

class RequestformSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requestform
        fields = '__all__'

class StudentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Students
        fields = '__all__'

class SubmittedprojectsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submittedprojects
        fields = '__all__'

