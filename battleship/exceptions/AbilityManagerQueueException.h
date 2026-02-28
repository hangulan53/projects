#ifndef ABILITY_MANAGER_QUEUE_EXCEPTION_H
#define ABILITY_MANAGER_QUEUE_EXCEPTION_H

#include <exception>

class AbilityManagerQueueException: public std::exception
{
public:
    const char* what() const noexcept override
    {
        return "Error: The ability queue is empty!\n";
    }
};

#endif