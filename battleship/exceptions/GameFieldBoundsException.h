#ifndef GAME_FIELD_BOUNDS_EXCEPTION_H
#define GAME_FIELD_BOUNDS_EXCEPTION_H

#include <exception>

class GameFieldBoundsException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Width and height must be > 0!\n";
    }
};

#endif