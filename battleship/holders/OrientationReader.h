#ifndef ORIENTATION_READER_H
#define ORIENTATION_READER_H

#include <iostream>
#include "../ship_organization/Ship.h"

class OrientationReader
{
public:
    Ship::Orientation readOrientation()
    {
        char o;
        std::cout << "Enter the orientation ('h' for horizontal, 'v' for vertical): ";
        std::cin >> o;

        return o == 'h' ? Ship::Orientation::HORIZONTAL : Ship::Orientation::VERTICAL;
    }
};

#endif