def char_count(string):
    counter = {}
    for i, char in enumerate(string):
        counter[char] = counter.get(char, 0) + 1
    return counter

if __name__ == "__main__":
    string = "hello world"
    result = char_count(string)
    print("Character count:", result)