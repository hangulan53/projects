#ifndef SHIP_MANAGER_INDEX_EXCEPTION_H
#define SHIP_MANAGER_INDEX_EXCEPTION_H

#include <exception>

class ShipManagerIndexException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Index out of ships count!\n";
    }
};

#endif