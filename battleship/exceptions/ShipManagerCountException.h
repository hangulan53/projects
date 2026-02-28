#ifndef SHIP_MANAGER_COUNT_EXCEPTION_H
#define SHIP_MANAGER_COUNT_EXCEPTION_H

#include <exception>

class ShipManagerCountException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: The submitted and actual number of ships must be equil!\n";
    }
};

#endif