import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Assignedprojects, Professors, Projects, Requestform, Students, Submittedprojects
from .serializers import (
    AssignedprojectsSerializer, ProfessorsSerializer, ProjectsSerializer,
    RequestformSerializer, StudentsSerializer, SubmittedprojectsSerializer
)

# 🔐 Signup API
@csrf_exempt
def signup_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            name = data.get("name")
            status = data.get("status")
            year = data.get("year") if status == "Student" else None

            if not email or not name or not status:
                return JsonResponse({"error": "All fields are required"}, status=400)

            if status == "Student":
                if Students.objects.filter(email_id=email).exists():
                    return JsonResponse({"error": "Student already exists"}, status=400)
                student = Students(email_id=email, name=name, year=year)
                student.save()
                return JsonResponse({"message": "Student registered successfully"}, status=201)

            elif status == "Professor":
                if Professors.objects.filter(email_id=email).exists():
                    return JsonResponse({"error": "Professor already exists"}, status=400)
                professor = Professors(email_id=email, name=name)
                professor.save()
                return JsonResponse({"message": "Professor registered successfully"}, status=201)

            return JsonResponse({"error": "Invalid status"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


# 🔑 Login API
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            status = data.get("status")

            if not email or not status:
                return JsonResponse({"error": "Email and status are required"}, status=400)

            if status == "Student":
                user = get_object_or_404(Students, email_id=email)
                return JsonResponse({"message": "Login successful", "name": user.name, "year": user.year, "status": "Student"}, status=200)

            elif status == "Professor":
                user = get_object_or_404(Professors, email_id=email)
                return JsonResponse({"message": "Login successful", "name": user.name, "status": "Professor"}, status=200)

            return JsonResponse({"error": "Invalid status"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


# 🏗️ Helper function for CRUD operations
def handle_crud_operations(model_class, serializer_class):
    @api_view(['GET', 'POST'])
    @permission_classes([IsAuthenticated])
    def list_or_create(request):
        if request.method == 'GET':
            items = model_class.objects.all()
            serializer = serializer_class(items, many=True)
            return Response(serializer.data)

        elif request.method == 'POST':
            serializer = serializer_class(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @api_view(['GET', 'PUT', 'DELETE'])
    @permission_classes([IsAuthenticated])
    def retrieve_update_delete(request, pk):
        try:
            item = model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        if request.method == 'GET':
            serializer = serializer_class(item)
            return Response(serializer.data)

        elif request.method == 'PUT':
            serializer = serializer_class(item, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        elif request.method == 'DELETE':
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    return list_or_create, retrieve_update_delete


# 📌 Views for each model
get_assigned_projects, assigned_project_detail = handle_crud_operations(Assignedprojects, AssignedprojectsSerializer)
get_professors, professor_detail = handle_crud_operations(Professors, ProfessorsSerializer)
get_projects, project_detail = handle_crud_operations(Projects, ProjectsSerializer)
get_requestforms, requestform_detail = handle_crud_operations(Requestform, RequestformSerializer)
get_students, student_detail = handle_crud_operations(Students, StudentsSerializer)
get_submitted_projects, submitted_project_detail = handle_crud_operations(Submittedprojects, SubmittedprojectsSerializer)

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user_email = request.user.email  # Ensure user email is retrieved from authentication
    status = request.GET.get("status")  # Status: Student or Professor

    if not user_email:
        return Response({"error": "User email not found in request"}, status=status.HTTP_400_BAD_REQUEST)

    if status == "Student":
        student = get_object_or_404(Students, email_id=user_email)
        assigned_projects = Assignedprojects.objects.filter(student_email_id=user_email)
        submitted_projects = Submittedprojects.objects.filter(student_email=user_email)

        assigned_serializer = AssignedprojectsSerializer(assigned_projects, many=True)
        submitted_serializer = SubmittedprojectsSerializer(submitted_projects, many=True)

        return Response({
            "email": student.email_id,
            "name": student.name,
            "year": student.year,
            "assigned_projects": assigned_serializer.data,
            "submitted_projects": submitted_serializer.data
        })

    elif status == "Professor":
        professor = get_object_or_404(Professors, email_id=user_email)
        assigned_projects = Assignedprojects.objects.filter(professor_email=professor.email_id)
        submitted_projects = Submittedprojects.objects.filter(professor_email=professor.email_id)

        assigned_serializer = AssignedprojectsSerializer(assigned_projects, many=True)
        submitted_serializer = SubmittedprojectsSerializer(submitted_projects, many=True)

        return Response({
            "email": professor.email_id,
            "name": professor.name,
            "assigned_projects": assigned_serializer.data,
            "submitted_projects": submitted_serializer.data
        })

    return Response({"error": "Invalid user status"}, status=status.HTTP_400_BAD_REQUEST)





import json
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from .models import Students, Projects, Professors, Requestform

def get_student_details(request, email):
    """Fetch student details based on the logged-in email."""
    try:
        student = Students.objects.get(email_id=email)

      
        program_name = student.year.strip()


        # Fetch projects based on student year
        projects = list(Projects.objects.filter(program=program_name).values_list('project_name', flat=True))

        # Fetch only professor emails (without names)
        professors = list(Professors.objects.values_list('email_id', flat=True))

        return JsonResponse({
            'name': student.name,
            'email': student.email_id,
            'year': student.year,
            'projects': projects,  # List of project names
            'professors': professors,  # List of professor emails
        })

    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)

@csrf_exempt
def submit_application(request):
    """Handle form submission and save request."""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            # Retrieve related objects using the provided email/project name
            student = Students.objects.get(email_id=data['student_email'])
            professor = Professors.objects.get(email_id=data['professor_email'])
            project = Projects.objects.get(project_name=data['project_name'])
            github_link = data.get('github_profile', '').strip()


            # Save request form entry with correct ForeignKey references
            request_entry = Requestform.objects.create(
                student_email=student,
                name=student.name,
                year=student.year,
                project_name=project,
                professor_email=professor,
                github_profile=github_link  # ✅ Save GitHub profile link
            )

            return JsonResponse({'message': 'Application submitted successfully!'}, status=201)

        except ObjectDoesNotExist:
            return JsonResponse({'error': 'Invalid student, professor, or project'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
import json
from .models import Assignedprojects, Requestform  # Assuming Requests is the request model
from datetime import datetime

# def get_professor_requests(request, email):
#     requests = Requestform.objects.filter(professor_email=email).values()
#     return JsonResponse(list(requests), safe=False)

def get_professor_requests(request, email):
    requests = Requestform.objects.filter(professor_email=email).select_related('project_name')

    request_list = [
        {
            "id": req.request_id,
            "name": req.name,
            "year": req.year,
            "project_name": req.project_name.project_name,  # ✅ Ensure this returns the actual name
        }
        for req in requests
    ]
    
    return JsonResponse(request_list, safe=False)

import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from datetime import datetime
from .models import Requestform, Assignedprojects


# ADD THE SENDERS HERE--> REMINDER
#update this to add the emails of the senders.
ALLOWED_SENDERS = ["priyamvada28negi@gmail.com",
                    "goyalyash1608@gmail.com"  ]  # Add verified emails here
@csrf_exempt
def accept_request(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request_id = data.get("request_id")
            deadline_date = data.get("deadline_date")
            whatsapp_link = data.get("whatsapp_link", "")  # ✅ Get the WhatsApp link

            if not request_id or not deadline_date:
                return JsonResponse({"error": "Missing request_id or deadline_date"}, status=400)

            try:
                deadline_date = datetime.strptime(deadline_date, "%Y-%m-%d").date()
            except ValueError:
                return JsonResponse({"error": "Invalid date format. Expected YYYY-MM-DD."}, status=400)

            project_request = get_object_or_404(Requestform, request_id=request_id)

            assigned_project = Assignedprojects.objects.create(
                student_email_id=project_request.student_email,
                name=project_request.name,
                year=project_request.year,
                project_name=project_request.project_name,
                professor_email=project_request.professor_email,
                deadline_date=deadline_date,
                whatsapp_link=whatsapp_link,  # ✅ Store WhatsApp link
                github_profile=project_request.github_profile,  # ✅ Copy GitHub profile
            )

            from_email = project_request.professor_email if project_request.professor_email in ALLOWED_SENDERS else "priyamvada28negi@gmail.com"
            recipient_email = project_request.student_email.email_id.strip()

            # ✅ Send email with WhatsApp link
            send_mail(
                subject="Project Request Accepted",
                message=f"Dear {project_request.name},\n\n"
                        f"Your project '{project_request.project_name}' has been accepted by {project_request.professor_email}. "
                        f"The deadline is {deadline_date}.\n\n"
                        f"Join the WhatsApp group for discussions: {whatsapp_link}\n\n"
                        f"Best regards,\nIIT BHU",
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            project_request.delete()
            return JsonResponse({"message": "Request accepted and assigned."})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "GET method not allowed. Use POST instead."}, status=405)


@csrf_exempt
def reject_request(request):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            request_id = data.get("request_id")

            project_request = get_object_or_404(Requestform, request_id=request_id)

            # Determine sender email
            from_email = project_request.professor_email if project_request.professor_email in ALLOWED_SENDERS else "priyamvada28negi@gmail.com"
            recipient_email = project_request.student_email.email_id.strip()

            # Send rejection email
            send_mail(
                subject="Project Request Rejected",
                message=f"Dear {project_request.name},\n\n"
                        f"We regret to inform you that your application for the project '{project_request.project_name}' "
                        f"could not be accepted because the project has reached its maximum student capacity.\n\n"
                        f"Please feel free to explore other opportunities in the future.\n\n"
                        f"Best wishes,\nIIT BHU",
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            project_request.delete()

            return JsonResponse({"message": "Request rejected and student notified via email."})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only DELETE method allowed."}, status=405)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
import traceback
from .models import Students, Assignedprojects, Submittedprojects, Projects, Professors

@csrf_exempt
def get_assigned_projects(request):
    """Fetch assigned projects for the logged-in student."""
    email = request.GET.get('email')  # Get email from request

    if not email:
        return JsonResponse({'error': 'Email parameter is required'}, status=400)

    # Validate student existence
    student = Students.objects.filter(email_id=email).first()
    if not student:
        return JsonResponse({'error': 'Student not found'}, status=403)

    # Fetch assigned projects for the student
    assigned_projects = Assignedprojects.objects.filter(student_email_id=student, marked=False)

    # Prepare response data
    project_list = [
        {
            'pid': ap.pid,
            'project_name': ap.project_name.project_name,  # Get project name from the Projects table
            'professor_email': ap.professor_email.email_id if ap.professor_email else None,
            'deadline_date': ap.deadline_date.strftime('%Y-%m-%d')
        }
        for ap in assigned_projects
    ]

    return JsonResponse({'assigned_projects': project_list}, safe=False)


@csrf_exempt
def submit_project(request):
    if request.method == "POST":
        student_email = request.POST.get("student_email")
        assigned_project_id = request.POST.get("assigned_project")
        project_name = request.POST.get("project_name")
        professor_email = request.POST.get("professor_email")
        file = request.FILES.get("file")

        print(f"Received Data: student_email={student_email}, assigned_project={assigned_project_id}, project_name={project_name}, professor_email={professor_email}, file={file}")

        if not (student_email and assigned_project_id and file):
            print("Missing required fields")
            return JsonResponse({"error": "Missing required fields"}, status=400)

        try:
            assigned_project = Assignedprojects.objects.get(pk=assigned_project_id, marked=False)
            professor = Professors.objects.get(email_id=professor_email)
            student = Students.objects.get(email_id=student_email)

            # Fetch the correct Project instance
            project = assigned_project.project_name  # Since it's now a ForeignKey, it gives us the whole Projects instance
            
            # 🔍 Fetch GitHub profile from Requestform table using student + project
          
            github_link = assigned_project.github_profile

            # Create a new submission entry
            submission = Submittedprojects.objects.create(
                student_email=student,
                assigned_project=assigned_project,
                project_name=project,  # Assign the whole Projects instance
                professor_email=professor,
                submission_date=now().date(),
                file=file,
                github_profile=github_link  # <-- Autofilled here
            )

            # Mark the assigned project as submitted
            assigned_project.marked = True
            assigned_project.save()

            print("Project submission successful")
            return JsonResponse({"message": "Project submitted successfully!"})

        except Assignedprojects.DoesNotExist:
            print(f"Assigned project with ID {assigned_project_id} not found.")
            return JsonResponse({"error": "Assigned project not found"}, status=404)
        except Professors.DoesNotExist:
            print(f"Professor with email {professor_email} not found.")
            return JsonResponse({"error": "Professor not found"}, status=404)
        except Students.DoesNotExist:
            print(f"Student with email {student_email} not found.")
            return JsonResponse({"error": "Student not found"}, status=404)
        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Internal Server Error:\n{error_details}")
            return JsonResponse({"error": "Internal Server Error", "details": str(e)}, status=500)

    print("Invalid request method")
    return JsonResponse({"error": "Invalid request"}, status=400)



from .models import Submittedprojects, Assignedprojects, Professors

@csrf_exempt
def get_pending_evaluations(request):
    """Fetch projects submitted to a professor that need feedback."""
    email = request.GET.get('email')  # Get professor email from request

    if not email:
        return JsonResponse({'error': 'Email parameter is required'}, status=400)

    # Validate professor existence
    professor = Professors.objects.filter(email_id=email).first()
    if not professor:
        return JsonResponse({'error': 'Professor not found'}, status=403)

    # Fetch submitted projects where feedback is NULL
    pending_submissions = Submittedprojects.objects.filter(professor_email=professor, feedback__isnull=True)

    if not pending_submissions.exists():
        return JsonResponse({'message': 'No results to be evaluated'}, status=200)

    # Prepare response data
    project_list = [
        {
            'submission_id': sp.submission_id,
            'student_email': sp.student_email.email_id,
            'project_name': sp.project_name.project_name,
            'submission_date': sp.submission_date.strftime('%Y-%m-%d'),
            'deadline_date': sp.assigned_project.deadline_date.strftime('%Y-%m-%d'),
            'file_url': request.build_absolute_uri(sp.file.url) if sp.file else None , # ✅ Absolute URL
            'github_profile': sp.github_profile  # ✅ Include GitHub link here
            # 'file_url': sp.file.url if sp.file else None  # File download link
        }
        for sp in pending_submissions
    ]

    return JsonResponse({'pending_evaluations': project_list}, safe=False)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Submittedprojects

@csrf_exempt
def submit_feedback(request):
    """Endpoint to update project feedback."""
    if request.method != "POST":
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        submission_id = data.get("submission_id")
        feedback = data.get("feedback")

        if not submission_id or not feedback:
            return JsonResponse({'error': 'Submission ID and feedback are required'}, status=400)

        project = Submittedprojects.objects.filter(submission_id=submission_id).first()

        if not project:
            return JsonResponse({'error': 'Project not found'}, status=404)

        # Update feedback and save
        project.feedback = feedback
        project.save()

        return JsonResponse({'message': 'Feedback submitted successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Projects

def get_projects(request):
    if request.method == "GET":
        projects = list(Projects.objects.values("project_name", "program"))
        return JsonResponse(projects, safe=False)
    
    return JsonResponse({"error": "Invalid request method."}, status=405)



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Professors, Projects

@csrf_exempt
def add_project(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            project_name = data.get("project_name")
            program = data.get("program")

            # Check if email exists in Professors table
            if not Professors.objects.filter(email_id=email).exists():
                return JsonResponse({"error": "Only Professors can add Projects."}, status=403)
            
             # Check if project already exists
            if Projects.objects.filter(project_name=project_name).exists():
                return JsonResponse({"error": "Project already exists."}, status=409)

            # Add project to database
            project = Projects(project_name=project_name, program=program)
            project.save()

            return JsonResponse({"message": "Project added successfully."}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)


@csrf_exempt
def delete_project(request):
    if request.method == "DELETE":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            project_name = data.get("project_name")

            # Check if email exists in Professors table
            if not Professors.objects.filter(email_id=email).exists():
                return JsonResponse({"error": "Only Professors can delete Projects."}, status=403)

            # Check if project exists
            project = Projects.objects.filter(project_name=project_name).first()
            if not project:
                return JsonResponse({"error": "Project not found."}, status=404)

            # Delete the project
            project.delete()
            return JsonResponse({"message": "Project deleted successfully."}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=405)

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Students, Professors, Submittedprojects, Assignedprojects

def get_profile(request, email):
    try:
        # Check if the user is a Student
        student = Students.objects.filter(email_id=email).first()
        if student:
            submitted_projects = Submittedprojects.objects.filter(student_email=student, feedback__isnull=False)
            project_data = [
                {
                    "project_name": sp.project_name.project_name,
                    "feedback": sp.feedback,
                    "submission_date": sp.submission_date,
                    "professor_email": sp.professor_email.email_id,
                }
                for sp in submitted_projects
            ]
            return JsonResponse({
                "role": "student",
                "name": student.name,
                "year": student.year,
                "submitted_projects": project_data,
            })
        
        # Check if the user is a Professor
        professor = Professors.objects.filter(email_id=email).first()
        if professor:
            assigned_students = Assignedprojects.objects.filter(professor_email=professor, marked=False)
            student_data = [
                {
                    "student_name": ap.name,
                    "student_year": ap.year,
                    "project_name": ap.project_name.project_name,
                    # "project_name": ap.project_name,
                    "deadline": ap.deadline_date,
                    "whatsapp_link": ap.whatsapp_link,
                }
                for ap in assigned_students
            ]
            return JsonResponse({
                "role": "professor",
                "name": professor.name,
                "assigned_students": student_data,
            })
        
        return JsonResponse({"error": "User not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Assignedprojects
from .serializers import AssignedprojectsSerializer

@csrf_exempt  # Disable CSRF protection for this view
def student_unmarked_projects(request, student_email):
    """
    Fetch all unmarked projects assigned to a student and allow them to set a meeting time.
    """
    if request.method == 'GET':
        # Fetch unmarked projects for the student
        assigned_projects = Assignedprojects.objects.filter(
            student_email_id__email_id=student_email, marked=False
        )
        
        # Serialize the data manually if needed
        project_data = [
            {
                "pid": ap.pid,  # include this!
                "project_name": ap.project_name.project_name,
                "professor_email": ap.professor_email.email_id,
                "meeting_time": ap.meeting_time
            }
            for ap in assigned_projects
        ]
        return JsonResponse(project_data, safe=False)

    elif request.method == 'POST':
        
        try:
        # Get project ID and meeting time from the request
            data = json.loads(request.body)
            project_id = data.get('project_id')
            meeting_time = data.get('meeting_time')

            if not project_id or not meeting_time:
                return JsonResponse({"error": "Project ID and Meeting Time are required."}, status=400)

        # Find the assigned project for the student
            assigned_project = get_object_or_404(Assignedprojects, pid=project_id, student_email_id__email_id=student_email, marked=False)
        
        # Update the meeting time
            assigned_project.meeting_time = meeting_time
            assigned_project.save()

            return JsonResponse({"message": "Meeting time updated successfully."}, status=200)
    
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {str(e)}")
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except Exception as e:
            print(f"Error setting meeting time: {str(e)}")
            return JsonResponse({"error": "Failed to set meeting time."}, status=500)


from django.http import JsonResponse
from .models import Assignedprojects, ProfessorMeetingSchedule

def student_final_meeting_time(request, student_email):
    """
    Fetch each distinct unmarked project’s final_meeting_time (no duplicates).
    """
    # Get all unmarked assignments for the student
    assigned_qs = Assignedprojects.objects.filter(
        student_email_id__email_id=student_email,
        marked=False
    )

    seen_projects = set()
    results = []

    for ap in assigned_qs:
        project_name = ap.project_name.project_name

        # Skip if we've already added this project
        if project_name in seen_projects:
            continue

        # Look for a schedule entry
        schedule = ProfessorMeetingSchedule.objects.filter(
            project_name=ap.project_name,
            professor_email=ap.professor_email
        ).first()

        if schedule:
            results.append({
                'project_name': project_name,
                'final_meeting_time': schedule.final_meeting_time
            })
            seen_projects.add(project_name)

    return JsonResponse(results, safe=False, status=200)


from django.http import JsonResponse
from .models import Assignedprojects, ProfessorMeetingSchedule
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def professor_assigned_projects(request, professor_email):
    """
    Show all projects and students assigned to this professor.
    Includes students' preferred meeting_time.
    """
    if request.method == 'GET':
        assigned_projects = Assignedprojects.objects.filter(
            professor_email__email_id=professor_email
        )

        project_data = [
            {
                "pid": ap.pid,
                "student_email": ap.student_email_id.email_id,
                "student_name": ap.name,
                "project_name": ap.project_name.project_name,
                "preferred_meeting_time": ap.meeting_time,
                "final_meeting_time": ProfessorMeetingSchedule.objects.filter(
                    project_name=ap.project_name,
                    professor_email=ap.professor_email
                ).first().final_meeting_time if ProfessorMeetingSchedule.objects.filter(
                    project_name=ap.project_name,
                    professor_email=ap.professor_email
                ).exists() else None
            }
            for ap in assigned_projects
        ]

        return JsonResponse(project_data, safe=False)


@csrf_exempt
def set_final_meeting_time(request):
    """
    Professors set final meeting time for a project.
    Expected POST data: { "professor_email": ..., "project_name": ..., "final_meeting_time": ... }
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            professor_email = data.get("professor_email")
            project_name = data.get("project_name")
            final_meeting_time = data.get("final_meeting_time")

            if not all([professor_email, project_name, final_meeting_time]):
                return JsonResponse({"error": "Missing required fields."}, status=400)

            # Find or create entry in ProfessorMeetingSchedule
            schedule, created = ProfessorMeetingSchedule.objects.get_or_create(
                professor_email_id=professor_email,
                project_name__project_name=project_name
            )

            schedule.final_meeting_time = final_meeting_time
            schedule.save()

            return JsonResponse({"message": "Final meeting time set successfully."})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
