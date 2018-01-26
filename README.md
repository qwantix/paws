# PAWS


Simple AWS pricing cli



## Install 

```
npm install -g paws-cli
```

## Usage


```
paws <service> <action> [options]
```

Supported services:

 - lambda
 - apigateway
 - athena
 - cloudwatch
 - dynamodb
 - ec2
 - cache
 - kinesis
 - firehose
 - rds
 - redshift
 - s3


### quote

All services implements command `quote`.

This command allow to estimate cost of service.


**Quote service ec2**
```
> paws ec2 quote -r eu-west-1 -i m3.medium --lease 1yr --upfront partial

» Total Monthly: $40.88/month
» Initial Fee: $468.00
» Smoothed monthly: $79.88/month
```

Here smoothed monthly is **Total Monthly** + **Initial fee** / (**leasing duration** * 12)   

**Quote service s3**
```
> paws s3 quote -r eu-west-1 --volume 16Go
» Total Monthly: $0.37/month
```

**Important:**
To estimate cost, paws load pricing file from aws. Some files (like ec2) are heavy and may take time to load. Be patient, files are put in local cache `/tmp/paws`



### Quote from yml file

Speed up your cost estimation and quote from a simple yaml file !

```yml
vars:
  eventsByDay: 4000000

defaults:
  region: eu-west-1
  
services:
  lambda:
    myFooLambda:
      size: 128
      invocations: ${eventsByDay}

  ec2:
    myServer:
      lease: 1yr
      upfront: partial
      instanceType: m3.medium

  s3:
    myBucket:
      volume: 10Go

  dynamodb:
    myDynamo:
      reads: 10/s
      writes: 10/min
```

This file contains 3 parts :
- `vars`: Define your custom vars
- `defaults`: Define your defaut params
- `services`: List of your services

Each services must be named (eg: myFooLambda) 


```
> paws quote sample.yml

lambda myFooLambda
──────────────────────────────────
  » Total Monthly: $9.13/month

ec2 myServer
──────────────────────────────────
  » Total Monthly: $40.88/month
  » Initial Fee: $468.00
  » Smoothed monthly: $79.88/month

s3 myBucket
──────────────────────────────────
  » Total Monthly: $0.23/month

dynamodb myDynamo
──────────────────────────────────
  » Total Monthly: $0.00/month


══════════════════════════════════
TOTAL
──────────────────────────────────
  » Total Monthly: $50.24/month
  » Initial Fee: $468.00
  » Smoothed monthly: $89.24/month

──────────────────────────────────

```

### regions

All services implements command `regions` like this:

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


### other commands

Each service implemnts customs commands like `instanceTypes` for `ec2` 

You can use `paws [service] --help` to print available commands

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




