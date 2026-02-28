#ifndef SHIP_LENGTH_EXCEPTION_H
#define SHIP_LENGTH_EXCEPTION_H

#include <exception>

class ShipLengthException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Ship length must be > 0 and < 5!\n";
    }
};

#endif