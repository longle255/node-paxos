# -*- mode: ruby -*-
# vi: set ft=ruby :

project = "node-paxos"

VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |baseconfig|

  baseconfig.vm.define project do |config|

    config.vm.provider "virtualbox" do |v|
      v.customize ["modifyvm", :id, "--memory", 2048]
      v.customize ["modifyvm", :id, "--cpus", 4]
    end

    config.vm.box = "bento/ubuntu-15.04"
    # config.vm.network "forwarded_port", guest: 3000, host: 3000
    config.vm.hostname = project

    config.vm.network :private_network, ip: "192.168.33.11"

    config.vm.synced_folder "~", "/vagrant"

    #This provisioner doesn't support --local in salt-call. We use shell
    #provisioning and we do salt steps by hand.
    config.vm.provision "shell", path: "vagrant/provision.sh", args: project

  end

end
