
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from account import views as a_views
from blog import views as b_views
from chat import views as c_views
from quiz import views as q_views
from therapy import views as t_views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
   # Admin
    path('admin/', admin.site.urls),

    # Account app URLs
    path('api/customer_signup/', a_views.customer_signup, name='customer_signup'),
    path('api/therapist_request_signup/', a_views.therapist_request_signup, name='therapist_request_signup'),
    path('api/list_therapist_request/', a_views.list_therapist_request, name='list_therapist_request'),
    path('api/requested_therapist_info/<int:request_id>/', a_views.requested_therapist_info, name='requested_therapist_info'),
    path('api/process_therapist_request/<int:request_id>/', a_views.process_therapist_request, name='process_therapist_request'),
    path('api/login/', a_views.login, name='login'),
    path('api/list_customer/', a_views.list_customer, name='list_customer'),
    path('api/view_customer_profile/<int:request_id>/', a_views.view_customer_profile, name='view_customer_profile'),
    path('api/delete_customer/<int:customer_id>/', a_views.delete_customer, name='delete_customer'),
    path('api/update_customer_profile/<int:customer_id>/', a_views.update_customer_profile, name='update_customer_profile'),
    path('api/create_hospital/', a_views.create_hospital, name='create_hospital'),
    path('api/view_hospital_list/', a_views.view_hospital_list, name='view_hospital_list'),
    path('api/view_specific_hospital_info/<int:pk>/', a_views.view_specific_hospital_info, name='view_specific_hospital_info'),
    path('api/update_hospital/<int:pk>/', a_views.update_hospital, name='update_hospital'),
    path('api/delete_hospital/<int:pk>/', a_views.delete_hospital, name='delete_hospital'),

    #blog app
    path('api/search_blog/', b_views.search_blog, name='search_blog'),
    path('api/get_my_blog/', b_views.get_my_blog, name='get_my_blog'),
    path('api/create_blog/', b_views.create_blog, name='create_blog'),
    path('api/blog_detail/<int:pk>/', b_views.blog_detail, name='blog_detail'),
    path('api/update_blog/<int:pk>/', b_views.update_blog, name='update_blog'),
    path('api/delete_blog/<int:pk>/', b_views.delete_blog, name='delete_blog'),

    #therapy app
    path('api/search_therapist/', t_views.search_therapist, name='search_therapist'),
    path('api/view_therapist_profile/<int:therapist_id>/', t_views.view_therapist_profile, name='view_therapist_profile'),
    path('api/update_therapist_profile/<int:therapist_id>/', t_views.update_therapist_profile, name='update_therapist_profile'),
    path('api/delete_therapist/<int:therapist_id>/', t_views.delete_therapist, name='delete_therapist'),
    path('api/book_appointment/<int:therapist_id>/', t_views.book_appointment, name='book_appointment'),
    path('api/customer_appointment_prev_history/', t_views.customer_appointment_prev_history, name='customer_appointment_prev_history'),
    path('api/customer_appointment_current_history/', t_views.customer_appointment_current_history, name='customer_appointment_current_history'),
    path('api/therapist_appointment_prev_history/', t_views.therapist_appointment_prev_history, name='therapist_appointment_prev_history'),
    path('api/therapist_appointment_current_history/', t_views.therapist_appointment_current_history, name='therapist_appointment_current_history'),
    path('api/cancel_appointment/<int:appointment_id>/', t_views.cancel_appointment, name='cancel_appointment'),
   
    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
