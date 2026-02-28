#ifndef GAME_FIELD_PLACEMENT_EXCEPTION_H
#define GAME_FIELD_PLACEMENT_EXCEPTION_H

#include <exception>

class GameFieldPlacementException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: Incorrect ship placement!\n";
    }
};

#endif