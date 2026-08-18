#Given a string of brackets, return True if they are all correctly closed.

#is_valid("([])") # → True is_valid("([)]") # → False is_valid("{[]}") # → True


def valid_paren(chain):
    w_chain = []
    w_chain2 = []
    for char in chain:
        print("char:", char)
        print("w_chain",w_chain)
        if w_chain:
            print("w_chain pos -1", w_chain[-1])
        if char in "([{":
            w_chain.append(char)
        elif char in "}])":
            if w_chain and w_chain[-1] == "(" and char == ")":
                w_chain.pop()
            elif w_chain and w_chain[-1] == "{" and char == "}":
                w_chain.pop()
            elif w_chain and w_chain[-1] == "[" and char == "]":
                w_chain.pop()
            else:
                w_chain2.append(char)
    if w_chain:
        for char in w_chain:
            w_chain2.append(char)

    return w_chain2
    

        
            
                
                
                
                
















if __name__ == "__main__":
    string_paren = ("(((({[())]}))")
    result = valid_paren(string_paren)
    if result == []:
        print("All parenthses have pair")
    else:
        print("These parenthses do not have pair that close it:",result)