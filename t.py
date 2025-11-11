import random

ops = ['+', '-', '*', '/']
ops1 = ['+', '-', '*', '/']
ops2 = ['+', '-', '*', '/']
exercises1 = []
exercises2 = []
random_start = -50
random_end = 50
amount_exercises = 200

for i in range(amount_exercises):
    a = random.randint(random_start, random_end)
    c = random.randint(random_start, random_end)
    d = random.randint(random_start, random_end)
    e = random.randint(random_start, random_end)
    op = random.choice(ops)
    op1 = random.choice(ops1)
    op2 = random.choice(ops2)
    
    # Avoid division by zero and ensure the result is an integer
    if op == '/' and c == 0:
        c = random.randint(1, random_end)

    if op1 == '/' and d == 0:
        d = random.randint(1, random_end)
        if a % c != 0:
            a = c * random.randint(1, random_end)  
    if op == '/' and e == 0:
        e = random.randint(1, random_end)
        if a % c % d != 0:
            a = c * d * random.randint(1, random_end)

    if op2 == '/' and e == 0:
        e = random.randint(1, random_end)
        if a % c % d % e != 0:
            a = c * d * e * random.randint(1, random_end)
            

    
    
    # Format negative numbers in parentheses
    a_str = f"({a})" if a < 0 else str(a)
    c_str = f"({c})" if c < 0 else str(c)
    d_str = f"({d})" if d < 0 else str(d)
    e_str = f"({e})" if e < 0 else str(e)
    
    if i % 2 == 0:
        exercises1.append(f"{a_str} {op} {c_str} {op1} {d_str} {op2} {e_str} = ")
    else:
        exercises2.append(f"{a_str} {op} {c_str} {op1} {d_str} {op2} {e_str} = ")

print(f"# {amount_exercises} One-Step Equations")

# Prepare output for both console and file
output_lines = [f"# {amount_exercises} One-Step Equations"]

# Print both columns side by side and save to file
max_len = max(len(exercises1), len(exercises2))
for i in range(max_len):
    left_col = f"{i*2 + 1}. {exercises1[i]}" if i < len(exercises1) else ""
    right_col = f"{i*2 + 2}. {exercises2[i]}" if i < len(exercises2) else ""
    line = f"{left_col:<50} {right_col}"
    print(line)
    output_lines.append(line)

# Save to file
with open("equations_output.docx", "w") as f:
    for line in output_lines:
        f.write(line + "\n")

print(f"\nOutput saved to 'equations_output.txt' - you can copy from this file!")
