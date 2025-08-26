from hyperon import MeTTa
import sys

def run_metta_file(filename):
    """Run a MeTTa file and show results"""
    print(f"🚀 Loading MeTTa file: {filename}")
    print("=" * 50)
    
    metta = MeTTa()
    
    try:
        # Read and execute the file
        with open(filename, 'r') as f:
            content = f.read()
        
        # Split into lines and execute each
        lines = content.strip().split('\n')
        
        for i, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith(';'):
                continue
            
            print(f"\n📝 Line {i}: {line}")
            
            try:
                result = metta.run(line)
                if result:
                    print(f"✅ Result: {result}")
                else:
                    print("✅ Executed successfully")
            except Exception as e:
                print(f"❌ Error: {e}")
                
    except FileNotFoundError:
        print(f"❌ File not found: {filename}")
    except Exception as e:
        print(f"❌ Error reading file: {e}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_scheduler.py <metta_file>")
        sys.exit(1)
    
    filename = sys.argv[1]
    run_metta_file(filename)