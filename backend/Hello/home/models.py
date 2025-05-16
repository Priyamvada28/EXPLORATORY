# whatsapp_link = models.URLField(max_length=500, null=True, blank=True)

from django.db import models

        
class Students(models.Model):
    email_id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)
    year = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'Students'


class Professors(models.Model):
    email_id = models.CharField(primary_key=True, max_length=255)
    name = models.CharField(max_length=255)

    class Meta:
        managed = True
        db_table = 'Professors'


class Projects(models.Model):
    project_name = models.CharField(primary_key=True, max_length=255)
    program = models.CharField(max_length=50)

    class Meta:
        managed = True
        db_table = 'Projects'


class Requestform(models.Model):
    request_id = models.AutoField(primary_key=True)
    student_email = models.ForeignKey('Students', models.DO_NOTHING,null=True, blank=True)
    name = models.CharField(max_length=255)
    year = models.CharField(max_length=50)
    project_name = models.ForeignKey(Projects, models.DO_NOTHING, db_column='project_name',null=True, blank=True)
    professor_email = models.ForeignKey(Professors, models.DO_NOTHING,null=True, blank=True)
    github_profile = models.URLField(max_length=500, null=True, blank=True)  # ✅ New Field
    class Meta:
        managed = True
        db_table = 'Requestform'


class Assignedprojects(models.Model):
    pid = models.AutoField(db_column='PID', primary_key=True)  
    student_email_id = models.ForeignKey(  
        'Students',  # Reference to Students table
        on_delete=models.CASCADE,  # If student is deleted, assigned projects also delete
        db_column='student_email_id'
    )
    name = models.CharField(max_length=255)
    year = models.CharField(max_length=50)
    
    project_name = models.ForeignKey(Projects, on_delete=models.CASCADE)  # ✅ Correct   // stored as an object now.
    professor_email = models.ForeignKey('Professors', models.DO_NOTHING, null=True, blank=True)
    
    deadline_date = models.DateField()
    whatsapp_link = models.URLField(max_length=500, null=True, blank=True)
    
    marked = models.BooleanField(default=False)  # False initially
    
    github_profile = models.URLField(max_length=500, null=True, blank=True)  # ✅ New Field
    
    # New field for meeting time
    MEETING_DAYS = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
    ]
    meeting_time = models.CharField(max_length=3, choices=MEETING_DAYS, null=True, blank=True)

    class Meta:
        managed = True
        db_table = 'Assignedprojects'



class Submittedprojects(models.Model):
    submission_id = models.AutoField(primary_key=True)
    student_email = models.ForeignKey(Students, models.DO_NOTHING, null=True, blank=True)
    project_name = models.ForeignKey(Projects, models.DO_NOTHING, db_column='project_name', null=True, blank=True)
    professor_email = models.ForeignKey(Professors, models.DO_NOTHING, null=True, blank=True)
    assigned_project = models.ForeignKey(Assignedprojects, models.DO_NOTHING, null=True, blank=True)
    submission_date = models.DateField(blank=True, null=True)
    feedback = models.IntegerField(blank=True, null=True)
    github_profile = models.URLField(max_length=500, blank=True, null=True)  # ✅ New field
    
    # file = models.CharField(max_length=255, null=True, blank=True)  # Store Google Drive file URL here
    
    # File will be stored in 'media/submissions/'
    file = models.FileField(upload_to="submissions/", null=True, blank=True)

    class Meta:
        managed = True
        db_table = 'Submittedprojects'


class ProfessorMeetingSchedule(models.Model):
    professor_email = models.ForeignKey('Professors', on_delete=models.CASCADE, db_column='professor_email')
    project_name = models.ForeignKey(Projects, on_delete=models.CASCADE)
    final_meeting_time = models.CharField(max_length=3, choices=Assignedprojects.MEETING_DAYS, null=True, blank=True)  # ✅ Uses choices from Assignedprojects

    class Meta:
        managed = True
        db_table = 'ProfessorMeetingSchedule'

