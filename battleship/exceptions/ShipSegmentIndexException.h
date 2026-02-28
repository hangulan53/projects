#ifndef SHIP_SEGMENT_INDEX_EXCEPTION_H
#define SHIP_SEGMENT_INDEX_EXCEPTION_H

#include <exception>

class ShipSegmentIndexException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Index out of ship length!\n";
    }
};

#endif