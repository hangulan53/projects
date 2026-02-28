#include "AbilityManager.h"

AbilityManager::AbilityManager(GameField& field):
    listOfAbilities(std::vector<AbilityFactory*>{new DoubleDamageFactory(), new RandomFireFactory(field), new ScannerFactory(field)}),
    abilityQueue(std::queue<AbilityFactory*>{}),
    field(field)
{
    std::vector<int> order = {0, 1, 2};
    std::shuffle(order.begin(), order.end(), std::default_random_engine());

    for (int i = 0; i < order.size(); i++){
        abilityQueue.push(listOfAbilities[order[i]]);
    }
}

void AbilityManager::addAbility()
{
    int index = rand() % listOfAbilities.size();
    abilityQueue.push(listOfAbilities[index]);
}

void AbilityManager::useAbility(LogHolder& logHolder)
{
    if (abilityQueue.empty())
    {
        throw AbilityManagerQueueException();
    }

    auto ability = abilityQueue.front();
    abilityQueue.pop();
    ability->createAbility()->activate(logHolder);
}

void AbilityManager::printAbilityQueue() const
{
    auto queue(abilityQueue);
    std::cout << "Ability queue:\n"; 
    for (int i = 0; i < abilityQueue.size(); i++){
        std::cout << i+1 << ") " << queue.front()->getName() << ".\n";
        queue.pop();
    }
}

nlohmann::json AbilityManager::toJson()
{
    nlohmann::json abilities = nlohmann::json::array();
    std::queue<AbilityFactory*> copyQueue = abilityQueue;

    while (!copyQueue.empty()) {
        abilities.push_back(copyQueue.front()->toJson());
        copyQueue.pop();
    }

    return nlohmann::json{
        {"abilities", abilities}
    };
}

void AbilityManager::fromJson(nlohmann::json& j)
{
    auto abilities = j["abilities"];
    while (!abilityQueue.empty())
    {
        abilityQueue.pop();
    }
    for (auto& item : abilities) {
        std::string ability = item["ability"].get<std::string>(); 
        if (ability == "random fire") {
            abilityQueue.push(new RandomFireFactory(field));
        } else if (ability == "double damage") {
            abilityQueue.push(new DoubleDamageFactory());
        } else if (ability == "scanner") {
            abilityQueue.push(new ScannerFactory(field));
        }
    }
}