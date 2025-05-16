from django.urls import path
from .views import (
    login_view, signup_view,
    get_assigned_projects, assigned_project_detail,
    get_professors, professor_detail,
    get_projects, project_detail,
    get_requestforms, requestform_detail,
    get_students, student_detail,
    get_submitted_projects, submitted_project_detail,
    user_profile
)

from .views import get_student_details, submit_application

# urlpatterns = [
#     path('student/<str:email>/', get_student_details, name='get_student_details'),
#     path('submit-application/', submit_application, name='submit_application'),
# ]
from django.urls import path
from home.views import submit_feedback


from .views import add_project


from .views import get_assigned_projects, submit_project


from .views import get_professor_requests, accept_request, reject_request

from .views import get_pending_evaluations

from .views import add_project, delete_project, get_projects

from .views import get_profile

# … your existing imports …
from .views import (
    # … other views …,
    student_unmarked_projects,
    student_final_meeting_time,
    professor_assigned_projects,
    set_final_meeting_time
    
)



urlpatterns = [
    
    path('professor/<str:professor_email>/assigned-projects/', professor_assigned_projects),
path('professor/set-meeting-time/',set_final_meeting_time),

    
    path(
        'student/<str:student_email>/unmarked-projects/',
        student_unmarked_projects,
        name='student-unmarked-projects'
    ),

    # 2. Fetch professor’s final_meeting_time for those same unmarked projects
    path(
        'student/<str:student_email>/final-meeting-time/',
        student_final_meeting_time,
        name='student-final-meeting-time'
    ),
    
    path("profile/<str:email>/", get_profile, name="get_profile"),
    
    path("delete_project/", delete_project, name="delete_project"),
    path("projects/", get_projects, name="get_projects"),  # New endpoint
    
    path("add_project/", add_project, name="add_project"),
    
    path("submit_feedback/", submit_feedback, name="submit_feedback"),
    path('get_pending_evaluations/', get_pending_evaluations, name='get_pending_evaluations'),
    path('get_assigned_projects/', get_assigned_projects, name='get_assigned_projects'),
    
    path('submit_project/', submit_project, name='submit_project'),
    path('professor-requests/<str:email>/', get_professor_requests, name='professor-requests'),
    
    path("accept-request/", accept_request, name="accept_request"),
    path("reject-request/", reject_request, name="reject_request"),
    path('student/<str:email>/', get_student_details, name='get_student_details'),
    path('submit-application/', submit_application, name='submit_application'),
    # Authentication
    path('login/', login_view, name="login"),
    path('signup/', signup_view, name="signup"),
    
    

    # Assigned Projects
    path('assignedprojects/', get_assigned_projects, name="get_assigned_projects"),
    path('assignedprojects/<int:pk>/', assigned_project_detail, name="assigned_project_detail"),

    # Professors
    path('professors/', get_professors, name="get_professors"),
    path('professors/<int:pk>/', professor_detail, name="professor_detail"),

    # Projects
    path('projects/', get_projects, name="get_projects"),
    path('projects/<int:pk>/', project_detail, name="project_detail"),

    # Request Forms
    path('requestforms/', get_requestforms, name="get_requestforms"),
    path('requestforms/<int:pk>/', requestform_detail, name="requestform_detail"),

    # Students
    path('students/', get_students, name="get_students"),
    path('students/<int:pk>/', student_detail, name="student_detail"),

    # Submitted Projects
    path('submittedprojects/', get_submitted_projects, name="get_submitted_projects"),
    path('submittedprojects/<int:pk>/', submitted_project_detail, name="submitted_project_detail"),
    
    path('profile/', user_profile, name='user-profile'),
]