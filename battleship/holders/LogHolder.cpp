#include "LogHolder.h"

std::pair<int, int> LogHolder::getData()
{
    return {x, y};
}

void LogHolder::setData(int x, int y)
{
    this->x = x;
    this->y = y;
}

LogHolder::Ability LogHolder::getAbility() const
{
    return this->ability;
}

void LogHolder::setAbility(LogHolder::Ability ability)
{
    this->ability = ability;
    this->abilityResult = LogHolder::AbilityResult::EMPTY;
}

LogHolder::AbilityResult LogHolder::getAbilityResult() const
{
    return this->abilityResult;
}

void LogHolder::setAbilityResult(LogHolder::AbilityResult abilityResult)
{
    this->abilityResult = abilityResult;
}

void LogHolder::printResult() const
{
    switch (this->ability)
    {
        case LogHolder::Ability::Scanner:
        {
            std::cout << "The scanner ability was used in the area (" << x << ", " << y <<") - (" << x+1 << ", " << y+1 << ").\n";
            if (abilityResult == LogHolder::AbilityResult::FOUND)
            {
                std::cout << "Result: some ship was found.\n";
            }
            else if (abilityResult == LogHolder::AbilityResult::EMPTY)
            {
                std::cout << "Result: ships weren`t found.\n";
            }
            else if (abilityResult == LogHolder::AbilityResult::OUTFIELD)
            {
                std::cout << "Result: all cells are out of the field! Ships weren`t found.\n";
            }
            break;
        }

        case LogHolder::Ability::RandomFire:
        {
            std::cout << "The random fire ability was used.\n";
            break;
        }

        default:
        {
            std::cout << "The double damage ability was used.\n";
            break;
        }
    }
}

nlohmann::json LogHolder::toJson()
{
    return nlohmann::json{
        {"ability", static_cast<int>(ability)},
        {"abilityResult", static_cast<int>(abilityResult)}
    };
}

void LogHolder::fromJson(nlohmann::json& j)
{
    ability = static_cast<Ability>(j["ability"]);
    abilityResult = static_cast<AbilityResult>(j["abilityResult"]);
}