# API Endpoints Documentation

## Authentication
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/logout`
- POST `/api/auth/refresh-token`

## Provider Services
- GET `/api/provider/services` - Get provider's services
- POST `/api/provider/services` - Add new service
- PUT `/api/provider/services/:id` - Update service
- DELETE `/api/provider/services/:id` - Delete service
- PATCH `/api/provider/services/:id/availability` - Update service availability

## Service Management
- GET `/api/services` - Get all services (with filters)
- GET `/api/services/:id` - Get service details
- GET `/api/services/categories` - Get service categories
- GET `/api/services/search` - Search services

## Bookings
- POST `/api/bookings` - Create new booking
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Update booking
- DELETE `/api/bookings/:id` - Cancel booking
- GET `/api/provider/bookings` - Get provider's bookings
- GET `/api/customer/bookings` - Get customer's bookings

## Reviews
- POST `/api/reviews` - Create review
- GET `/api/reviews/:id` - Get review details
- POST `/api/reviews/:id/response` - Add provider response
- GET `/api/provider/reviews` - Get provider's reviews
- GET `/api/services/:id/reviews` - Get service reviews

## Notifications
- GET `/api/notifications` - Get user's notifications
- POST `/api/notifications/:id/read` - Mark notification as read
- DELETE `/api/notifications/:id` - Delete notification

## Provider Profile
- GET `/api/provider/profile` - Get provider profile
- PUT `/api/provider/profile` - Update provider profile
- POST `/api/provider/documents` - Upload provider documents
- GET `/api/provider/documents` - Get provider documents
- DELETE `/api/provider/documents/:id` - Delete provider document

## Payment
- POST `/api/payments/intent` - Create payment intent
- POST `/api/payments/confirm` - Confirm payment
- GET `/api/payments/methods` - Get saved payment methods
- POST `/api/payments/methods` - Add payment method
- DELETE `/api/payments/methods/:id` - Remove payment method

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": string,
    "message": string
  }
}
```

## Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Server Error

## Authentication
All endpoints except auth/login and auth/register require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```
