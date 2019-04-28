# f('bdca') => ['bca', 'bda']

'bdca', 'bda', 'b', 'a'

def diffValid(string, word):
    for i in range(len(string)):
        if word == (string[:i] + string[i+1:]):
            return True

def test(string, dict):
    listOfPossibleWords = []
    for word in dict:
        if (len(word) == len(string) - 1) and diffValid(string, word):
            listOfPossibleWords.append(word)
    return listOfPossibleWords