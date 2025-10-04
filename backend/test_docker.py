#!/usr/bin/env python3
"""
Test script to verify Docker connectivity and container visibility
"""
import docker
import subprocess
import json
from docker.errors import DockerException

def test_docker_api():
    """Test Docker Python API connectivity"""
    print("Testing Docker Python API...")
    try:
        client = docker.from_env()
        containers = client.containers.list(all=True)
        chatbot_containers = [c for c in containers if c.name.startswith('chatbot_')]
        
        print(f"✓ Docker API working - Found {len(containers)} total containers")
        print(f"✓ Found {len(chatbot_containers)} chatbot containers")
        
        for container in chatbot_containers:
            print(f"  - {container.name}: {container.status}")
        
        return True, len(chatbot_containers)
    except DockerException as e:
        print(f"✗ Docker API failed: {e}")
        return False, 0

def test_docker_subprocess():
    """Test Docker subprocess commands"""
    print("\nTesting Docker subprocess commands...")
    try:
        result = subprocess.run(
            ["docker", "ps", "-a", "--format", "json"],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.strip():
            containers = []
            for line in result.stdout.strip().split('\n'):
                if line.strip():
                    try:
                        container_data = json.loads(line)
                        name = container_data.get("Names", "")
                        if name.startswith('chatbot_'):
                            containers.append({
                                "name": name,
                                "status": container_data.get("State", ""),
                                "id": container_data.get("ID", "")[:12]
                            })
                    except json.JSONDecodeError:
                        continue
            
            print(f"✓ Docker subprocess working - Found {len(containers)} chatbot containers")
            for container in containers:
                print(f"  - {container['name']}: {container['status']} ({container['id']})")
            
            return True, len(containers)
        else:
            print(f"✗ Docker subprocess failed: {result.stderr}")
            return False, 0
            
    except Exception as e:
        print(f"✗ Docker subprocess failed: {e}")
        return False, 0

def test_docker_socket():
    """Test Docker socket accessibility"""
    print("\nTesting Docker socket accessibility...")
    import os
    socket_path = "/var/run/docker.sock"
    
    if os.path.exists(socket_path):
        print(f"✓ Docker socket exists at {socket_path}")
        try:
            stat = os.stat(socket_path)
            print(f"✓ Socket permissions: {oct(stat.st_mode)[-3:]}")
            return True
        except Exception as e:
            print(f"✗ Cannot access socket: {e}")
            return False
    else:
        print(f"✗ Docker socket not found at {socket_path}")
        return False

if __name__ == "__main__":
    print("Docker Connectivity Test")
    print("=" * 50)
    
    api_success, api_count = test_docker_api()
    subprocess_success, subprocess_count = test_docker_subprocess()
    socket_success = test_docker_socket()
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    print(f"Docker API: {'✓' if api_success else '✗'}")
    print(f"Docker Subprocess: {'✓' if subprocess_success else '✗'}")
    print(f"Docker Socket: {'✓' if socket_success else '✗'}")
    
    if api_success or subprocess_success:
        print(f"\nContainer visibility should work!")
        print(f"Chatbot containers found: {max(api_count, subprocess_count)}")
    else:
        print(f"\n⚠️  Container visibility will NOT work!")
        print("Recommendations:")
        print("1. Ensure Docker is running")
        print("2. Mount Docker socket: -v /var/run/docker.sock:/var/run/docker.sock")
        print("3. Add docker group permissions if needed")