# PAWS


Simple AWS pricing cli


## Install 

```
npm install -g paws-cli
```

## Usage

List regions for EC2

```
> paws ec2 regions

Available regions:
 -  ap-northeast-1
 -  ap-northeast-2
 -  ap-south-1
 -  ap-southeast-1
 -  ap-southeast-2
 -  ca-central-1
 -  eu-central-1
 -  eu-west-1
 -  eu-west-2
 -  eu-west-3
 -  sa-east-1
 -  us-east-1
 -  us-east-2
 -  us-gov-west-1
 -  us-west-1
 -  us-west-2

```

List instances 
```
> paws ec2 instanceTypes -r eu-west-1 --family general

Available instances:

 -  m3.2xlarge
 -  m3.large
 -  m3.medium
 -  m3.xlarge
 -  m4.10xlarge
 -  m4.16xlarge
 -  m4.2xlarge
 -  m4.4xlarge
 -  m4.large
 -  m4.xlarge
 -  m5.12xlarge
 -  m5.24xlarge
 -  m5.2xlarge
 -  m5.4xlarge
 -  m5.large
 -  m5.xlarge
 -  t2.2xlarge
 -  t2.large
 -  t2.medium
 -  t2.micro
 -  t2.nano
 -  t2.small
```

Get more informations
```
> paws ec2 instanceTypes -r eu-west-1  --search m3.medium --details

Available instances:

 -  m3.medium
        Family                     :    General purpose
        Current Generation         :    Yes
        vCPU                       :    1
        ecu                        :    3
        Physical Processor         :    Intel Xeon E5-2670 v2 (Ivy Bridge/Sandy Bridge)
        Processor Features         :    Intel AVX; Intel Turbo
        Architecture               :    64-bit
        Clock Speed                :    2.5 GHz
        Memory                     :    3.75 GiB
        Storage                    :    1 x 4 SSD
        Network Performance        :    Moderate
        Normalization Size Factor  :    2
        Operating System           :    Windows, RHEL, SUSE, Linux
```


Quote service
```
> paws ec2 quote -r eu-west-1 -i m3.medium --lease 1yr --upfront partial

» Total Monthly: $40.88/month
» Initial Fee: $468.00
» Smoothed monthly: $79.88/month
```


Quote file
```
> paws quote sample.yml

lambda myFooLambda
──────────────────────────────────
  » Total Monthly: $9.13/month

ec2 server
──────────────────────────────────
  » Total Monthly: $40.88/month
  » Initial Fee: $468.00
  » Smoothed monthly: $79.88/month


══════════════════════════════════
TOTAL
──────────────────────────────────
  » Total Monthly: $50.01/month
  » Initial Fee: $468.00
  » Smoothed monthly: $89.01/month

```

Be patient, the first call may take some time

