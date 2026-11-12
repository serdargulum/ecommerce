namespace Ecommerce.Api.Common;

public class BusinessException(string message) : Exception(message);

public class NotFoundException(string message) : Exception(message);

public class UnauthorizedException(string message) : Exception(message);
