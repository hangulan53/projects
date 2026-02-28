#ifndef COORD_READER_H
#define COORD_READER_H

#include <iostream>

class CoordReader
{
public:
    std::pair<int, int> readCoordinates()
    {
        int x, y;
        std::cout << "Enter the coordinates: ";
        std::cin >> x >> y;
        return {x, y};
    }
};

#endif