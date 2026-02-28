#ifndef INFO_HOLDER_H
#define INFO_HOLDER_H

#include <iostream>

class InfoHolder
{
public:
    virtual std::pair<int, int> getData() = 0;
    virtual ~InfoHolder() = default;
};

#endif