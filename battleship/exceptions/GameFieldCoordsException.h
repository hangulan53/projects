#ifndef GAME_FIELD_COORDS_EXCEPTION_H
#define GAME_FIELD_COORDS_EXCEPTION_H

#include <exception>

class GameFieldCoordsException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Coordinates beyond the borders!\n";
    }
};

#endif