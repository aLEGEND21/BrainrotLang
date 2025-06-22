# This should only be run directly and located one directory above the project
echo y | docker image prune
rm -rf BrainrotLang
git clone https://github.com/aLEGEND21/BrainrotLang.git
cd BrainrotLang
sudo docker build -t brainrot-lang .
sudo docker rm -f brainrot-lang
sudo docker run -d --name brainrot-lang -p 2003:2003 --network=nginx-proxy brainrot-lang