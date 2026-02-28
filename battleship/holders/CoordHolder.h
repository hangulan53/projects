#ifndef COORD_HOLDER_H
#define COORD_HOLDER_H

#include "InfoHolder.h"
#include "CoordReader.h"

class CoordHolder: public InfoHolder
{
private:
    int x, y;
    CoordReader* coordReader;
    
public:
    std::pair<int, int> getData() override
    {
        return {x, y};
    }

    void setData()
    {
        std::pair<int, int> coords = coordReader->readCoordinates();
        x = coords.first;
        y = coords.second;
    }
};

#endif